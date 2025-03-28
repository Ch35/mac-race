'use client'

import { useEffect, useState } from 'react';
import { getSession, login } from '@/lib/login';
import { useRouter } from 'next/navigation';
import { Button, Input, SimpleGrid } from '@mantine/core';
import classes from './page.module.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getSession().then((response) => {
      if (response) {
        router.push('/admin');
      }
    });
  }, [router]);

  return (
    <div className={classes.container}>
      <div>
        <SimpleGrid>
          <h1>Login</h1>

          <form
            action={async (formData: FormData) => {
              setError('');

              if (await login(formData)) {
                router.push('/admin');
              } else {
                setError('Invalid credentials');
              }
            }}
          >
            <SimpleGrid className={classes.form}>
              <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Input.Wrapper label="Auth ID:">
                  <Input name='authId' />
                </Input.Wrapper>
              </div>
              <div>
                <Input.Wrapper label="Credentials:">
                  <Input name='authCred' type='password' />
                </Input.Wrapper>
              </div>
              <Button variant='default' type="submit">Login</Button>
            </SimpleGrid>
          </form>
        </SimpleGrid>
      </div>
    </div>
  )
}