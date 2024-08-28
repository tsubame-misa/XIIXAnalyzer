import { useState, useEffect } from "react";
import * as d3 from "d3";

const RADIUS = 7.5;
const LINK_WIDTH = 1;
const LINK_DISTANCE = 15;
const FORCE_RADIUS_FACTOR = 2.5;
const NODE_STRENGTH = -10;

function App() {
  const [threshold, setThreshold] = useState(0.95);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showInfo, setShowInfo] = useState(null);

  function makeAllEdges(songs, threshold) {
    const edges = [];
    for (let i = 0; i < songs.length - 1; i++) {
      for (let j = i + 1; j < songs.length; j++) {
        if (songs[i]["similarity"][songs[j]["id"]] <= threshold) {
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

  function getAlubums(songs) {
    return Array.from(new Set(songs.map((s) => s.album_name)));
  }

  useEffect(() => {
    (async () => {
      const songsResponse = await fetch("/songs.json");
      const songs = await songsResponse.json();
      const edges = makeAllEdges(songs, threshold);
      const albums = getAlubums(songs);

      setAlbums(albums);

      const simulation = d3
        .forceSimulation(songs)
        .force(
          "link",
          d3
            .forceLink(edges)
            .id((d) => d.id)
            .distance(LINK_DISTANCE)
        )
        .force("center", d3.forceCenter(600 / 2, 700 / 2).strength(0.05))
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
  }, [threshold]);

  const color = d3.scaleOrdinal(d3.schemePaired);

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
          <div
            className="content"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              href="https://xiix-web.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              XIIX
            </a>
            の楽曲の類似度を表しています。
            類似度の高い楽曲はエッジで結ばれています。
            ノードをクリックすると楽曲ページを別タブで開くことができます。
          </div>
          <div
            className="content"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems:"center"
            }}
          >
            類似度の閾値を選択してください。
            <div className="select is-dark">
              <select onChange={(e) => setThreshold(e.target.value)}>
                <option value={0.95}>0.95</option>
                <option value={0.925}>0.925</option>
                <option value={0.9}>0.9</option>
                <option value={0.875}>0.875</option>
                <option value={0.85}>0.85</option>
              </select>
            </div>
          </div>
          <div
            className="content"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div>
              <svg height={600} width={600}>
                <rect width={600} height={600} rx={14} fill={"#272b4d"} />
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
                  return (
                    <circle
                      key={node.id}
                      r={RADIUS}
                      stroke="none"
                      strokeWidth={1}
                      fill={color(node.album_name)}
                      cx={node.x}
                      cy={node.y}
                      onMouseOver={() => {
                        console.log("click", node.name);
                        setShowInfo({
                          name: node.name,
                          album_name: node.album_name,
                        });
                      }}
                      onMouseLeave={() => {
                        setShowInfo(null);
                      }}
                      onClick={() =>
                        window.open(
                          node.external_urls,
                          "_blank",
                          "noopener noreferrer"
                        )
                      }
                    />
                  );
                })}
                {showInfo && (
                  <g>
                    <rect width={600} height={75} rx={14} fill={"#FFFFFF91"} />
                    <text x="10" y="30" fontSize="20" fill="black">
                      アルバム名：{showInfo.album_name}
                    </text>
                    <text x="10" y="60" fontSize="20" fill="black">
                      楽曲名：{showInfo.name}
                    </text>
                  </g>
                )}
              </svg>

              <svg height={600} width={300}>
                {albums?.map((album, idx) => {
                  console.log(idx, Math.floor(idx / 2));
                  return (
                    <g key={album}>
                      <circle
                        r={15}
                        stroke="none"
                        strokeWidth={1}
                        fill={color(album)}
                        cx={25 + 30 * 0}
                        cy={50 + 40 * Math.floor(idx)}
                      />
                      <text
                        x={25 + 30 * 0 + 20}
                        y={50 + 40 * Math.floor(idx)}
                        fontSize="15"
                        stroke="black"
                        dominantBaseline="middle"
                      >
                        {album}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
