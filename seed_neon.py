import os
import subprocess
import sys

def run_db_setup():
    print("==================================================")
    print("         Aether Store - Database Setup            ")
    print("==================================================")
    
    # Prompt the user for the connection string
    db_url = input("\nPlease paste your Neon connection string:\n> ").strip()
    
    if not db_url.startswith("postgres://") and not db_url.startswith("postgresql://"):
        print("\nError: Invalid connection string. It must start with postgres:// or postgresql://")
        return

    # Update environment variables for the subprocesses
    env = os.environ.copy()
    env["DATABASE_URL"] = db_url

    print("\n[1/3] Installing database driver and dependencies...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd="backend",
            env=env,
            check=True
        )
    except subprocess.CalledProcessError:
        print("\nError: Failed to install python dependencies.")
        return

    print("\n[2/3] Running migrations on your live Neon database...")
    try:
        subprocess.run(
            [sys.executable, "manage.py", "migrate"],
            cwd="backend",
            env=env,
            check=True
        )
    except subprocess.CalledProcessError:
        print("\nError: Migrations failed. Please verify your connection string or database status.")
        return

    print("\n[3/3] Seeding catalog products and test user...")
    try:
        subprocess.run(
            [sys.executable, "manage.py", "seed_db"],
            cwd="backend",
            env=env,
            check=True
        )
    except subprocess.CalledProcessError:
        print("\nError: Seeding failed.")
        return

    print("\n==================================================")
    print("🎉 Success! Your Neon database is fully set up.")
    print("You can now connect Koyeb or Vercel to this database.")
    print("==================================================")

if __name__ == "__main__":
    run_db_setup()
