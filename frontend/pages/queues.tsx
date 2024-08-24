import { faRotateRight, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Container, Nav, Stack, Table } from "react-bootstrap";
import { Job, PaginationResponse } from "../api";

export default function Queues() {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState("api");
  const jobs = useQuery({
    queryFn: async () => {
      const url = `/api/admin/queues/${queue}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch queue HTTP ${response.status}`);
      }
      return await response.json() as PaginationResponse<Job>;
    },
    queryKey: ["Queue", queue],
    placeholderData: {
      totalPages: 1,
      results: [],
    }
  });
  const retryJob = useMutation({
    mutationFn: async (job_id: string) => {
      const url = `/api/admin/queues/${queue}/${job_id}/retry`;
      const response = await fetch(url, {method: "POST"});
      if (!response.ok) {
        throw new Error(`Fetch queue HTTP ${response.status}`);
      }
      const data: PaginationResponse<Job> = {
        totalPages: 1,
        results: jobs.data.results.filter(job => job.id !== job_id)
      };
      queryClient.setQueryData(["Queue", queue], data);
    },
  });
  const removeJob = useMutation({
    mutationFn: async (job_id: string) => {
      const url = `/api/admin/queues/${queue}/${job_id}`;
      const response = await fetch(url, {method: "DELETE"});
      if (!response.ok) {
        throw new Error(`Fetch queue HTTP ${response.status}`);
      }
      const data: PaginationResponse<Job> = {
        totalPages: 1,
        results: jobs.data.results.filter(job => job.id !== job_id)
      };
      queryClient.setQueryData(["Queue", queue], data);
    },
  });

  return (
    <Container>
      <Stack style={{alignItems: "center"}}>
        <h1>Queues</h1>
        <Nav variant="underline" defaultActiveKey={queue} onSelect={setQueue}>
          <Nav.Link eventKey="api">Api</Nav.Link>
          <Nav.Link eventKey="community">Community</Nav.Link>
          <Nav.Link eventKey="meta">Meta</Nav.Link>
          <Nav.Link eventKey="store">Store</Nav.Link>
        </Nav>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Failure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.data.results.map(job => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.name}</td>
                <td>{job.failedReason}</td>
                <td>
                  <Button
                    disabled={retryJob.isPending || removeJob.isPending}
                    variant="success"
                    onClick={() => retryJob.mutate(job.id)}
                    title="Retry"
                  >
                    <FontAwesomeIcon icon={faRotateRight}/>
                  </Button>
                  <Button
                    disabled={retryJob.isPending || removeJob.isPending}
                    variant="danger"
                    onClick={() => removeJob.mutate(job.id)}
                    title="Remove"
                  >
                    <FontAwesomeIcon icon={faTrashCan}/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Container>
  );
}
