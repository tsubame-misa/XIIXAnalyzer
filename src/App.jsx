import { useState, useEffect } from "react";
import * as d3 from "d3";
import Header from "./components/layout/header";
import SongChart, { createEdgeId } from "./components/chart/songsChart";

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

  function makeAllEdges(songs, threshold) {
    const edges = [];
    for (let i = 0; i < songs.length - 1; i++) {
      for (let j = i + 1; j < songs.length; j++) {
        if (songs[i]["similarity"][songs[j]["id"]] <= threshold) {
          continue;
        }
        const obj = {
          id: createEdgeId(songs[i], songs[j]),
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

  return (
    <>
      <Header />
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

          <SongChart
            edges={edges}
            songs={songs}
            albums={albums}
            setThreshold={setThreshold}
          />
        </section>
      </main>
    </>
  );
}

export default App;
