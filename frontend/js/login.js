        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const res = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: document.getElementById('user').value,
                    password: document.getElementById('pass').value
                })
            });

            if(res.ok) {
                const data = await res.json();
                localStorage.setItem('nombreUsuario', data.nombre); // Guarda el nombre para el Dashboard
                window.location.href = "index.html"; 
            } else {
                document.getElementById('error').classList.remove('d-none');
            }
        }
