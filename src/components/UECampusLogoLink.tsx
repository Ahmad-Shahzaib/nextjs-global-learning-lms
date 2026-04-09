
import ueLogo from "../../public/uecampus-logo.png";
import whiteLogo from "../../public/white.png";

interface GlobalLearningLogoLinkProps {
  className?: string;
  containerClassName?: string;
}

export function GlobalLearningLogoLink({
  className = "h-20 w-auto",
  containerClassName = "",
}: GlobalLearningLogoLinkProps) {
  return (
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit Global Learning homepage"
      className={`inline-flex items-center ${containerClassName}`.trim()}
    >
      <img
        src={ueLogo}
        alt="Global Learning logo"
        className={`block dark:hidden ${className} h-10 sm:h-10 md:h-12 lg:h-10 xl:h-12 w-auto max-w-full`}
      />
      <img
        src={whiteLogo}
        alt="Global Learning logo"
        className={`hidden dark:block ${className} h-10 sm:h-10 md:h-12 lg:h-10 xl:h-12 w-auto max-w-full`}
      />
      <span className="sr-only">Visit the Global Learning website</span>
    </a>
  );
}
