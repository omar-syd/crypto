import React, { useEffect, useState } from "react";
import { graphql } from "gatsby";
import { useLocation } from "@reach/router"; // 👈 Import useLocation
import InfoBox from "../components/InfoBox";
import Navbar from "../components/Navbar";
import "../styles/flowchart.css";
import mermaid from "mermaid"; // Import Mermaid

const MarkdownFlowchart = ({ data }) => {
  const location = useLocation(); // 👈 Detects when user navigates
  const [info, setInfo] = useState({
    title: "",
    text: "",
    link: "",
  });

  const [markdownContent, setMarkdownContent] = useState(
    data?.allMdx?.nodes?.[0]?.body || ""
  );
  const [infoData, setInfoData] = useState(
    data?.allMdx?.nodes?.[0]?.frontmatter?.infoData || []
  );

  // Re-run effect if Markdown file changes
  useEffect(() => {
    setMarkdownContent(data?.allMdx?.nodes?.[0]?.body || "");
    setInfoData(data?.allMdx?.nodes?.[0]?.frontmatter?.infoData || "");
  }, [data]);

  useEffect(() => {
    const addCustomListeners = () => {
      const nodes = document.querySelectorAll(".hoverNode,.highlighted-node");

      nodes.forEach((node) => {
        node.addEventListener("mouseover", (event) => {
          const nodeId = node.textContent.trim();
          const nodeInfo = infoData.find((item) => item.id === nodeId);

          if (nodeInfo) {
            setInfo(nodeInfo);
            const infoBox = document.getElementById("info-box");
            if (infoBox) {
              infoBox.style.display = "block";
              infoBox.style.left = `${event.clientX + 15}px`;
              infoBox.style.top = `${event.clientY + 15}px`;
            }
          }
        });

        node.addEventListener("mousemove", (event) => {
          const infoBox = document.getElementById("info-box");
          if (infoBox) {
            infoBox.style.left = `${event.clientX + 15}px`;
            infoBox.style.top = `${event.clientY + 15}px`;
          }
        });

        node.addEventListener("mouseout", () => {
          setInfo({ title: "", text: "", link: "" });
          const infoBox = document.getElementById("info-box");
          if (infoBox) {
            infoBox.style.display = "none";
          }
        });

        node.addEventListener("click", () => {
          const nodeId = node.textContent.trim();
          const nodeInfo = infoData.find((item) => item.id === nodeId);

          if (nodeInfo?.link) {
            window.location.href = nodeInfo.link;
          }
        });
      });
    };

    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: false });

    // Force re-initialization when navigating back
    setTimeout(() => {
      mermaid.contentLoaded();
      addCustomListeners();
    }, 100);

  }, [markdownContent, infoData, location.pathname]); // 👈 Add location.pathname to re-run effect

  return (
    <div key={location.pathname}> {/* 👈 Forces re-render when navigating back */}
      <Navbar />
      <div className="flowchart-container">
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Markdown Flowchart</h1>
        <div className="mermaid-wrapper">
          {markdownContent ? (
            <div className="mermaid">
              {markdownContent
                .replace("```mermaid", "")
                .replace("```", "")
                .trim()}
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>No content available.</p>
          )}
        </div>
        <InfoBox info={info} />
      </div>
    </div>
  );
};

export const query = graphql`
  query {
    allMdx(
      filter: {
        internal: { contentFilePath: { regex: "/src/components/md/" } }
      }
    ) {
      nodes {
        body
        frontmatter {
          infoData {
            id
            title
            text
            link
          }
        }
      }
    }
  }
`;

export default MarkdownFlowchart;
