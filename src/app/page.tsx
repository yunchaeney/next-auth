import { getSession } from "@/lib/getSession";

export default async function page() {
  const session = await getSession();

  console.log(session);
  return (
    <>
      <h1>page Component</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
}
