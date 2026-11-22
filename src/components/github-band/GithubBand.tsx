import { SOURCE_URL } from "../../const";

import "./GithubBand.css";

/** Diagonal "View on GitHub" band in the top-right corner of the page. */
const GithubBand = () => (
  <div className="github-band">
    <a href={SOURCE_URL}>View on GitHub</a>
  </div>
);

export default GithubBand;
