import React from "react";
import { Link } from "react-router-dom";
import {
  Container
} from "react-bootstrap";

export function Home() {
    return (<Container className={"vh-100 d-flex align-items-center justify-content-center"}><Link to="/browse">Start browsing</Link></Container>)
}