import { Image, ImageProps } from "react-bootstrap";

export enum AppImageType {
  Header = "header",
  CapsuleSmall = "capsule_sm_120",
}

export interface AppImageProps extends Exclude<ImageProps, "src"> {
  app_id: number;
  type: AppImageType;
}

export function AppImage({app_id, type, ...props}: AppImageProps) {
  const url = `https://steamcdn-a.akamaihd.net/steam/apps/${app_id}/${type}.jpg`;
  return (
    <Image src={url} {...props}/>
  );
}
