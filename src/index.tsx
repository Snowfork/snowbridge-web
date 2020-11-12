import ReactDOM from "react-dom";
import React, {Suspense} from "react";

import App from "./App";

ReactDOM.render(
  <Suspense fallback="...">
    <App />
  </Suspense>,
  document.getElementById("root"),
);
