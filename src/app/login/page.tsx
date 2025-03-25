import { redirect } from "next/navigation";

async function test(form: FormData) {
  'use server';

  if (form.get('id') == process.env.AUTH_ID && form.get('cred') == process.env.AUTH_CRED) {
    // TODO: store session 
    return redirect('/admin');
  }

  redirect('/');
}

export default function Home() {
  return (
    <>
      <form action={test}>
        <input type="text" name="id" id="id" placeholder="id" />
        <input type="text" name="cred" id="cred" placeholder="cred" />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}