<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Customer Login</title>
</head>
<body>
    <h1>Customer Login</h1>
    @if($errors->any())
        <div style="color:red">
            <ul>
                @foreach($errors->all() as $e)
                    <li>{{ $e }}</li>
                @endforeach
            </ul>
        </div>
    @endif
    <form method="POST" action="{{ route('customer.login.post') }}">
        @csrf
        <label>Email <input type="email" name="email" value="{{ old('email') }}" required></label><br>
        <label>Password <input type="password" name="password" required></label><br>
        <button type="submit">Login</button>
    </form>
    <p><a href="{{ route('customer.register') }}">Create an account</a></p>
</body>
</html>
