import Image from "next/image";
import classes from './Footer.module.css'

export default function Footer() {
  return (
    <footer>
      <a
        className={classes.floatingIcon}
        href="https://milnertonaquaticclub.co.za"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/logo.png"
          alt="MAC Logo"
          width={32}
          height={32}
        />
      </a>
    </footer>
  );
}