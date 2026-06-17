import os
from rest_framework import generics, viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Category, Product, CartItem, WishlistItem, Order, OrderItem
from .serializers import (
    UserSerializer, RegisterSerializer, CategorySerializer,
    ProductSerializer, CartItemSerializer, WishlistItemSerializer, OrderSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = Product.objects.all()
        category_slug = self.request.query_params.get('category', None)
        search_query = self.request.query_params.get('search', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query) | queryset.filter(description__icontains=search_query)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        
        cart_item, created = CartItem.objects.get_or_create(
            user=self.request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            serializer.instance = cart_item
        else:
            serializer.instance = cart_item

class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=self.request.user,
            product=product
        )
        serializer.instance = wishlist_item

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_index_by('-created_at') if hasattr(Order.objects, 'order_index_by') else Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def checkout(self, request):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)
        
        if not cart_items.exists():
            return Response({"error": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
            
        shipping_address = request.data.get('shipping_address', None)
        payment_id = request.data.get('payment_id', f"sim_{os.urandom(8).hex()}" if 'os' in globals() else "sim_default")
        
        if not shipping_address:
            return Response({"error": "Shipping address is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        total_price = 0
        order_items_to_create = []
        products_to_update = []
        
        for item in cart_items:
            product = item.product
            if product.stock < item.quantity:
                return Response(
                    {"error": f"Insufficient stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            total_price += product.price * item.quantity
            
            order_items_to_create.append(
                OrderItem(
                    product=product,
                    price=product.price,
                    quantity=item.quantity
                )
            )
            
            product.stock -= item.quantity
            products_to_update.append(product)
            
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            status='paid',
            shipping_address=shipping_address,
            payment_id=payment_id
        )
        
        for order_item in order_items_to_create:
            order_item.order = order
            order_item.save()
            
        for p in products_to_update:
            p.save()
            
        cart_items.delete()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
