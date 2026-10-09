import Image from "next/image";

import type { AutomotiveScene } from "@/content/automotive-scenes";
import { cn } from "@/lib/utils";

export function AutomotiveBackdrop({
  scene,
  priority = false,
  className,
}: {
  scene: AutomotiveScene;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-20", className)}
      aria-hidden="true"
    >
      <Image
        src={scene.src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-[68%_center]"
      />
    </div>
  );
}
