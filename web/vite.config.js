import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js', 'resources/css/filament/admin/theme.css'],
            refresh: true,
            fonts: [
                // Gövde metni — mobil uygulamayla aynı
                bunny('Inter', { weights: [400, 500, 600, 700, 800] }),
                // Başlıklar — uygulamadaki Reem Kufi
                bunny('Reem Kufi', { weights: [400, 500, 600, 700] }),
                // Arapça (besmele, ayet)
                bunny('Amiri', { weights: [400, 700] }),
            ],
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
