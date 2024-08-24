import { Image } from "react-bootstrap";

export interface CountryIconProps {
  code?: string
}

export function CountryIcon({code}: CountryIconProps) {
  if (code == 'AQ') {
    code = null; // Antarctica has no flag
  }

  return code ? (
    <Image src={`https://steamcommunity-a.akamaihd.net/public/images/countryflags/${code.toLowerCase()}.gif`} alt="CountryCode"/>
  ) : null;
}
