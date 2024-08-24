
import { useQuery } from "@tanstack/react-query";
import { Container, Image, Nav, Navbar, NavDropdown, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchAccount } from "../api";
import { Avatar, AvatarSize } from "./Avatar";

export function MyNavbar() {
  const account = useQuery({
    queryFn: fetchAccount,
    queryKey: ["Account"],
    staleTime: Infinity,
    placeholderData: null,
  });

  const accountElement = account.isPlaceholderData ? (
    <p>Loading...</p>
  ) : account.isError ? (
    <p>Error</p>
  ) : account.data ? (
    <Stack direction="horizontal">
      <Avatar avatar={account.data.avatar} size={AvatarSize.Icon}/>
      <NavDropdown title={account.data.name} align="end">
        <NavDropdown.Item as={Link} to={`/users/${account.data.steam_id}`}>Profile</NavDropdown.Item>
        <NavDropdown.Item as={Link} to={`/users/${account.data.steam_id}/apps`}>Achievement Games</NavDropdown.Item>
      </NavDropdown>
    </Stack>
  ) : (
    <Nav.Link href="/auth/steam">
      <Image src="/assets/images/sits_01.png"/>
    </Nav.Link>
  );

  return (
    <Navbar expand="md" sticky="top" bg="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <Image
            src="/assets/images/steam_icon_logo.svg"
            width={32}
            height={32}
          />
        </Navbar.Brand>
        <Navbar.Toggle/>
        <Navbar.Collapse>
          <Nav navbarScroll>
            <NavDropdown title="Games">
              <NavDropdown.Item as={Link} to="/apps">Steam Games</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Search">
              <NavDropdown.Item as={Link} to="/add_user">Add User</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Top Lists">
              <NavDropdown.Item></NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Recent">
              <NavDropdown.Item></NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Community">
              <NavDropdown.Item></NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="About">
              <NavDropdown.Item></NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav className="ms-auto">
            {accountElement}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
