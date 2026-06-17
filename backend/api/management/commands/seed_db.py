from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Category, Product

class Command(BaseCommand):
    help = 'Seeds the database with categories, products, and default users.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # 1. Create Default Users
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('Created superuser: admin / admin123')
        else:
            self.stdout.write('Superuser admin already exists.')

        if not User.objects.filter(username='testuser').exists():
            User.objects.create_user('testuser', 'testuser@example.com', 'testuser123')
            self.stdout.write('Created test user: testuser / testuser123')
        else:
            self.stdout.write('Test user testuser already exists.')

        # 2. Create Categories
        categories_data = [
            {'name': 'Electronics'},
            {'name': 'Fashion'},
            {'name': 'Home & Living'},
            {'name': 'Wellness'},
        ]

        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(name=cat_data['name'])
            categories[cat_data['name']] = cat
            if created:
                self.stdout.write(f"Created category: {cat.name}")

        # 3. Create Products
        products_data = [
            {
                'category': 'Electronics',
                'name': 'Quantum Noise-Cancelling Headphones',
                'description': 'Experience pure sound with hybrid active noise cancellation, high-fidelity audio, and up to 40 hours of battery life. Sleek ergonomic design with ultra-soft earcups.',
                'price': 199.99,
                'stock': 50,
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Electronics',
                'name': 'Vivid View 4K Smart Projector',
                'description': 'Transform your living room into a theater. Features 3000 lumens, HDR10 compatibility, Android TV built-in, and auto-focus for crystal clear viewing.',
                'price': 599.99,
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Electronics',
                'name': 'AuraGlow Mechanical Keyboard',
                'description': 'Tactile mechanical switch keyboard with customizable RGB backlighting, aircraft-grade aluminum frame, and hot-swappable keycaps for typing perfection.',
                'price': 129.99,
                'stock': 30,
                'image_url': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Fashion',
                'name': 'Classic Leather Chelsea Boots',
                'description': 'Handcrafted from premium full-grain Italian leather, featuring flexible elastic side panels, a cushioned leather lining, and a durable rubber sole.',
                'price': 149.99,
                'stock': 25,
                'image_url': 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Fashion',
                'name': 'Urban Explorer Waterproof Backpack',
                'description': 'A versatile commuter backpack made of weather-resistant ballistic nylon. Includes a padded 16-inch laptop sleeve, hidden anti-theft pockets, and clean magnetic closures.',
                'price': 89.99,
                'stock': 40,
                'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Home & Living',
                'name': 'Artisan Ceramic Drip Coffee Maker',
                'description': 'Hand-thrown ceramic pour-over cone and matching carafe. Designed to brew the perfect cup while adding a touch of rustic modern style to your countertop.',
                'price': 45.00,
                'stock': 20,
                'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Home & Living',
                'name': 'Smart Thermostatic Gooseneck Kettle',
                'description': 'Precision-pour matte black kettle with variable temperature control, 1-hour temperature hold, and a bright LCD screen to monitor target temperature.',
                'price': 119.99,
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80'
            },
            {
                'category': 'Wellness',
                'name': 'Therapeutic Amethyst Face Roller',
                'description': 'Revitalize skin elasticity and encourage blood circulation with a natural amethyst face roller and Gua Sha set. Keep in the fridge for a soothing morning routine.',
                'price': 34.99,
                'stock': 50,
                'image_url': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80'
            }
        ]

        for p_data in products_data:
            cat = categories[p_data['category']]
            prod, created = Product.objects.get_or_create(
                name=p_data['name'],
                defaults={
                    'category': cat,
                    'description': p_data['description'],
                    'price': p_data['price'],
                    'stock': p_data['stock'],
                    'image_url': p_data['image_url']
                }
            )
            if created:
                self.stdout.write(f"Created product: {prod.name}")
            else:
                # Update attributes if it already exists to refresh links
                prod.category = cat
                prod.description = p_data['description']
                prod.price = p_data['price']
                prod.stock = p_data['stock']
                prod.image_url = p_data['image_url']
                prod.save()
                self.stdout.write(f"Updated product: {prod.name}")

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
