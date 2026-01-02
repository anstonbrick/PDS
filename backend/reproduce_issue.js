// Node 18+ has native fetch
// Node 18+ has native fetch, so we might not need require.
// If valid node version, this works.

async function test() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'adminpassword123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Update Status
        const updateRes = await fetch('http://localhost:3002/api/admin/requests/14/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'reviewing' })
        });

        const updateData = await updateRes.json();
        console.log('Update Status:', updateRes.status);
        console.log('Body:', JSON.stringify(updateData, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

test();
