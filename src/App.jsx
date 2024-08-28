import { useState, useEffect } from "react";
import * as d3 from "d3";

const RADIUS = 5;
const LINK_WIDTH = 1;
const LINK_DISTANCE = 15;
const FORCE_RADIUS_FACTOR = 2.5;
const NODE_STRENGTH = -10;

function App() {
  const [threshold, setThreshold] = useState(0.95);
  const [songs, setSongs] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showInfo, setShowInfo] = useState(null);

  function makeAllEdges(songs) {
    const edges = [];
    for (let i = 0; i < songs.length - 1; i++) {
      for (let j = i + 1; j < songs.length; j++) {
        if (songs[i]["similarity"][songs[j]["id"]] <= 0.95) {
          continue;
        }
        const obj = {
          source: songs[i]["id"],
          target: songs[j]["id"],
          value: songs[i]["similarity"][songs[j]["id"]],
        };
        edges.push(obj);
      }
    }
    return edges;
  }

  useEffect(() => {
    (async () => {
      const songsResponse = await fetch("/songs.json");
      const songs = await songsResponse.json();
      const edges = makeAllEdges(songs, threshold);

      console.log(edges);

      const simulation = d3
        .forceSimulation(songs)
        .force(
          "link",
          d3
            .forceLink(edges)
            .id((d) => d.id)
            .distance(LINK_DISTANCE)
        )
        .force("center", d3.forceCenter(600 / 2, 600 / 2).strength(0.05))
        .force("charge", d3.forceManyBody().strength(NODE_STRENGTH))
        .force("collision", d3.forceCollide(RADIUS * FORCE_RADIUS_FACTOR));

      // update state on every frame
      simulation.on("tick", () => {
        setSongs([...simulation.nodes()]);
        setEdges([...edges]);
      });

      return () => {
        simulation.stop();
      };
    })();
  }, []);

  return (
    <>
      <header className="hero is-dark is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">XIIX Analyzer</h1>
          </div>
        </div>
      </header>
      <main>
        <section className="section">
          <div className="content" >
            XIIXの楽曲の類似度を表しています。
            類似度の高い楽曲はエッジで結ばれています。
          </div>
          <div className="content" style={{ "display":  "flex" , "justifyContent": "center" }}>
            <svg height={600} width={600}>
              <rect width={600} height={800} rx={14} fill={"#272b4d"} />
              {edges.map((link) => {
                const { source, target } = link;
                const modSource = source;
                const modTarget = target;

                return (
                  <line
                    key={`${modSource.id}-${modTarget.id}`}
                    stroke="white"
                    strokeWidth={LINK_WIDTH}
                    strokeOpacity={1}
                    x1={modSource.x}
                    y1={modSource.y}
                    x2={modTarget.x}
                    y2={modTarget.y}
                  />
                );
              })}
              {songs.map((node) => {
                // console.log("node", node.name, node.x);
                return (
                  <circle
                    key={node.id}
                    r={RADIUS}
                    stroke="none"
                    strokeWidth={1}
                    fill="pink"
                    cx={node.x}
                    cy={node.y}
                    onMouseOver={() => {
                      console.log("click", node.name);
                      setShowInfo({ name: node.name, url: node.external_urls });
                    }}
                    onMouseLeave={() => {
                      setShowInfo(null);
                    }}
                    // onClick={()}
                  />
                );
              })}
              {showInfo && (
                <g>
                  <rect width={600} height={50} rx={14} fill={"#FFFFFF91"} />
                  <a href={showInfo.url}></a>
                  <text x="10" y="30" fontSize="20" fill="black">
                    楽曲名：{showInfo.name}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
