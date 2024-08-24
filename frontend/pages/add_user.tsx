import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Card, Col, Container, Form, Row, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const searchUser = useMutation({
    mutationFn: async (query: string) => {
      const url = "/api/add_user";
      const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query}),
      });
      if (!response.ok) {
        throw new Error(`Add user HTTP ${response.status}`);
      }
      const data = await response.json() as {steam_id: string};
      navigate(`/users/${data.steam_id}`);
    }
  });


  return (
    <Container>
      <Stack direction="horizontal" className="justify-content-center">
        <Stack gap={2} className="flex-grow-0">
          <Form>
            <Form.Group>
              <Stack direction="horizontal">
                <Form.Control
                  placeholder="SteamID or profile url"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <Button variant="primary" onClick={() => searchUser.mutate(input)}>Search</Button>
              </Stack>
            </Form.Group>
          </Form>
          <Card>
            <Card.Header>Accepted Formats</Card.Header>
            <Card.Body>
              <Stack>
                <a>76561197968575517</a>
                <a>https://steamcommunity.com/profiles/76561197968575517</a>
                <a>STEAM_0:1:4154894</a>
                <a>[U:1:8309789]</a>
                <a>https://steamcommunity.com/id/ChetFaliszek</a>
              </Stack>
            </Card.Body>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
