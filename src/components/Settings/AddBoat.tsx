'use client'

import { fetcher } from "@/lib/api";
import { Button, Input, Loader, NativeSelect, SimpleGrid } from "@mantine/core";
import { Class } from "@prisma/client";
import { useState } from "react";
import useSWR, { mutate } from "swr";

export default function AddBoat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { data: boatClasses }: { data: Class[] } = useSWR("/api/boats/classes", fetcher);

  async function addBoat(formData: FormData) {
    setLoading(true);
    setError('');
    setSuccess('');

    const response = await fetch('/api/boats/add', {
      method: 'POST',
      body: JSON.stringify({
        number: formData.get('number'),
        name: formData.get('name'),
        class: formData.get('class'),
        race: formData.get('race'),
      }),
    });

    try {
      const body = await response.json();

      if (response.status === 200) {
        mutate("/api/boats");
        setSuccess(`${body.name} added successfully`);
      } else {
        setError(body?.error ?? 'An error occurred');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={addBoat}>
      <SimpleGrid>
        {success && <p style={{ color: 'green' }}>{success}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <Loader color="blue" />}

        <Input.Wrapper label="Number:"><Input name="number" required /></Input.Wrapper>
        <Input.Wrapper label="Name:"><Input name="name" required /></Input.Wrapper>
        <NativeSelect
          label="Class:"
          name="class"
          data={!boatClasses ? [] : boatClasses.map((boatClass) => ({ value: boatClass.id.toString(), label: boatClass.name }))}
        />
        <NativeSelect label="Races:" name="race" data={['24h', '12h']} required />

        <Button variant='outline' type="submit">Submit</Button>
      </SimpleGrid>
    </form>
  );
}