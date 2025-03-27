import { Button, Input, Loader, SimpleGrid } from "@mantine/core";
import { useState } from "react";

export default function EditFlags() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // TODO: fetch min/max lap time for races (global)
  // TODO: update min/max lap time for all races
  async function action() {
    
  }

  return (
      <form
        action={action}
      >
        <SimpleGrid>
          {success && <p style={{ color: 'green' }}>{success}</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <Loader color="blue" />}
  
          <Input.Wrapper label="Min Lap Time (Minutes):"><Input name="min" required /></Input.Wrapper>
          <Input.Wrapper label="Max Lap Time (Minutes):"><Input name="max" required /></Input.Wrapper>
  
          <Button variant='outline' type="submit">Submit</Button>
        </SimpleGrid>
      </form>
    );
}