
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\frank\\Downloads\\Zync-mobile';
const replacements = {
    '@/presentation/components/ui/': '@/components/',
    '@/presentation/components/': '@/components/',
    '@/application/ZyncContext': '@/context/ZyncContext',
    '@/application/CartContext': '@/features/wallet/context/CartContext',
    '@/infrastructure/spotify-service': '@/features/music/services/spotify-service',
    '@/presentation/components/TicketCard': '@/features/dashboard/components/TicketCard',
    '@/presentation/components/ui/PaymentCard': '@/features/wallet/components/PaymentCard',
    // Fix relative paths if any (simple heuristic)
    '../../presentation/components/': '@/components/',
    '../presentation/components/': '@/components/'
};

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') walk(filePath);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let original = content;
                for (const [oldVal, newVal] of Object.entries(replacements)) {
                    content = content.split(oldVal).join(newVal);
                }
                if (content !== original) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated ${filePath}`);
                }
            }
        }
    });
}

walk(projectRoot);
