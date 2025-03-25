import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function NotFound() {
    return (
        <Container className="mt-5 text-center">
            <Row>
                <Col>
                    <h1>404 Not Found</h1>
                    <p className="lead">The page you are looking for does not exist.</p>
                </Col>
            </Row>
        </Container>
    );
}

export default NotFound;