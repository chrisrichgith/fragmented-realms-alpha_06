function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = React.useState(true);

  // State for login form
  const [loginIdentifier, setLoginIdentifier] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // State for register form
  const [registerUsername, setRegisterUsername] = React.useState('');
  const [registerEmail, setRegisterEmail] = React.useState('');
  const [registerPassword, setRegisterPassword] = React.useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = React.useState('');

  const handleLogin = () => {
    if (!loginIdentifier || !loginPassword) {
      return alert('Username/Email and password are required.');
    }
    const tempSocket = io();
    tempSocket.on('login success', (userData) => {
      // Pass both user data and the new socket up to the App
      onLoginSuccess(userData, tempSocket);
    });
    tempSocket.on('login failed', (data) => {
      alert(`Login failed: ${data.message}`);
      tempSocket.disconnect();
    });
    tempSocket.emit('login', { identifier: loginIdentifier, password: loginPassword });
  };

  const handleRegister = () => {
    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
        return alert('All fields are required for registration.');
    }
    if (registerPassword !== registerConfirmPassword) {
        return alert('Passwords do not match.');
    }
    // For registration, we can use a temporary socket and discard it.
    const tempSocket = io();
    tempSocket.on('register success', () => {
        alert('Registration successful! Please log in.');
        setIsLogin(true);
        tempSocket.disconnect();
    });
    tempSocket.on('register failed', (data) => {
        alert(`Registration failed: ${data.message}`);
        tempSocket.disconnect();
    });
    tempSocket.emit('register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
    });
  };

  return (
    <div className="login-overlay">
        <div className="login-box">
            <div className="tabs">
                <button className={`tab-link ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
                <button className={`tab-link ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Registrieren</button>
            </div>

            {isLogin ? (
                <div className="tab-content">
                    <h3>Login</h3>
                    <input type="text" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} placeholder="Benutzername oder Email" required />
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Passwort" required />
                    <button onClick={handleLogin}>Spiel betreten</button>
                </div>
            ) : (
                <div className="tab-content">
                    <h3>Registrieren</h3>
                    <input type="text" value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} placeholder="Benutzername" required maxlength="20" />
                    <input type="email" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} placeholder="Email" required />
                    <input type="password" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} placeholder="Passwort" required />
                    <input type="password" value={registerConfirmPassword} onChange={e => setRegisterConfirmPassword(e.target.value)} placeholder="Passwort bestätigen" required />
                    <button onClick={handleRegister}>Account erstellen</button>
                </div>
            )}
        </div>
    </div>
  );
}
