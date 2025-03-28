import { Button, Input, Loader, SimpleGrid } from "@mantine/core";
import { Race } from "@prisma/client";
import { useState } from "react";
import { mutate } from "swr";

type Props = { races: Race[], close: () => void };

export default function EditFlags({ races, close }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function action(formData: FormData) {
    setLoading(true);
    setError('');
    setSuccess('');

    const response = await fetch('/api/editflags', {
      method: 'POST',
      body: JSON.stringify({
        min: formData.get('min'),
        max: formData.get('max'),
      }),
    });

    try {
      const body = await response.json();
      if (response.status === 200) {
        mutate("/api/boats");
        mutate("/api/races");
        close();
      } else {
        setError(body?.error ?? 'An error occurred');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const firstRace = races[0] ?? { minLapTime: 5, maxLapTime: 10 };

  return (
    <form
      action={action}
    >
      <SimpleGrid>
        {success && <p style={{ color: 'green' }}>{success}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <Loader color="blue" />}

        <Input.Wrapper label="Min Lap Time (Minutes):">
          <Input name="min" type="number" required defaultValue={firstRace.minLapTime} />
        </Input.Wrapper>

        <Input.Wrapper label="Max Lap Time (Minutes):">
          <Input name="max" type="number" required defaultValue={firstRace.maxLapTime} />
        </Input.Wrapper>

        <Button variant='outline' type="submit">Submit</Button>
      </SimpleGrid>
    </form>
  );
}