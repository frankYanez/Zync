
import os

project_root = r"c:\Users\frank\Downloads\Zync-mobile"
replacements = {
    "@/presentation/components/ui/": "@/components/",
    "@/presentation/components/": "@/components/",
    "@/application/ZyncContext": "",
    "@/application/CartContext": "@/features/wallet/context/CartContext",
    "@/infrastructure/spotify-service": "@/features/music/services/spotify-service",
    "@/presentation/components/TicketCard": "@/features/dashboard/components/TicketCard",
    "@/presentation/components/ui/PaymentCard": "@/features/wallet/components/PaymentCard",
}

for root, dirs, files in os.walk(project_root):
    # skip node_modules and .git
    if "node_modules" in root or ".git" in root:
        continue
        
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")
