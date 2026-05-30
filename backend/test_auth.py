import httpx
base='http://127.0.0.1:8000'
print('registering')
r = httpx.post(f'{base}/api/auth/register', json={'email':'test+local@example.com','password':'TestPass123','full_name':'Test Local'})
print(r.status_code)
print(r.text)
print('login')
r2 = httpx.post(f'{base}/api/auth/login', data={'username':'test+local@example.com','password':'TestPass123'})
print(r2.status_code)
print(r2.text)
