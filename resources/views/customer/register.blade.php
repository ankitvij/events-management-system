<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Customer Register</title>
</head>
<body>
    <h1>Create Customer Account</h1>
    @if($errors->any())
        <div style="color:red">
            <ul>
                @foreach($errors->all() as $e)
                    <li>{{ $e }}</li>
                @endforeach
            </ul>
        </div>
    @endif
    <form method="POST" action="{{ route('customer.register.post') }}">
        @csrf
        <label>Name <input type="text" name="name" value="{{ old('name') }}" required></label><br>
        <label>Email <input type="email" name="email" value="{{ old('email') }}" required></label><br>
        <label>Password <input type="password" name="password" required></label><br>
        <label>Confirm <input type="password" name="password_confirmation" required></label><br>
        <button type="submit">Create Account</button>
    </form>
</body>
</html>
