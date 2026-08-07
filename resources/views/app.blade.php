<!DOCTYPE html>
<html
    lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    @class(['dark' => ($appearance ?? 'system') == 'dark'])
>

<head>
    <meta charset="utf-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(0.99 0 0);
        }

        html.dark {
            background-color: oklch(0.2 0 0);
            ;
        }

        html {
            height: 100vh;
            overflow: hidden;
        }
    </style>

    @php
        $org = \App\Models\Organization::current();
        $faviconUrl = $org->logo ? '/storage/' . $org->logo . '?v=' . time() : '/favicon.svg?v=1';
    @endphp

    <title inertia>{{ $org->name ?? config('app.name', 'Laravel') }}</title>

    <link
        rel="icon"
        href="{{ $faviconUrl }}"
    >
    <link
        rel="apple-touch-icon"
        href="/apple-touch-icon.png"
    >

    <link
        rel="preconnect"
        href="https://fonts.bunny.net"
    >
    <link
        href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
        rel="stylesheet"
    />

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="bg-sidebar font-sans antialiased">
    @inertia
</body>

</html>
