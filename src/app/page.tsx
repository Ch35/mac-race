import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        Mac 24 Hour Race
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://milnertonaquaticclub.co.za"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Milnerton Aquatic Club
          <Image
            aria-hidden
            src="/logo.png"
            alt="MAC Logo"
            width={32}
            height={32}
          />
        </a>
      </footer>
    </div>
  );
}
