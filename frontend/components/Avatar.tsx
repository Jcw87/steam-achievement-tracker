import { Image, ImageProps } from "react-bootstrap";

export enum AvatarSize {
  Icon = "",
  Medium = "_medium",
  Full = "_full",
}

export interface AvatarProps extends Exclude<ImageProps, "src"> {
  avatar: string | null;
  size: AvatarSize;
}

export const DEFAULT_AVATAR = "fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb";

export function Avatar({avatar, size, ...props}: AvatarProps) {
  avatar = avatar ?? DEFAULT_AVATAR;
  const url = `https://avatars.akamai.steamstatic.com/${avatar}${size}.jpg`;
  return (
    <Image src={url} {...props}/>
  );
}
