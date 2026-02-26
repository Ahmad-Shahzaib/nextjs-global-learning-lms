
import ueLogo from "../../public/uecampus-logo.png";


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
      <img src={ueLogo} alt="Global Learning logo" className={className} />
      <span className="sr-only">Visit the Global Learning website</span>
    </a>
  );
}
