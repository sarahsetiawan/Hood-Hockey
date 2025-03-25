import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Home() {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Welcome to the Hood Hockey Dashboard</h1>
          <p>This is the central hub for your hockey analytics.</p>
        </Col>
      </Row>
      {/* Future dashboard sections will go here */}
    </Container>
  );
}

export default Home;