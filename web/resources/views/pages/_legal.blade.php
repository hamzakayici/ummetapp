@extends('layouts.app')
@section('content')
<section class="mx-auto max-w-3xl px-5 py-16">
    <h1 class="font-display text-4xl font-bold text-ink">@yield('heading')</h1>
    <p class="mt-2 text-sm text-ink-muted">Son güncelleme: {{ now()->translatedFormat('d F Y') }}</p>
    <div class="mt-10 space-y-6 text-ink-dim leading-relaxed">@yield('body')</div>
</section>
@endsection
