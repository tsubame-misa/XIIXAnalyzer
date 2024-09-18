import { useState } from "react";
import * as d3 from "d3";

const RADIUS = 7.5;
const LINK_WIDTH = 1;

export function createEdgeId(a, b) {
  return a["id"] + "-" + b["id"];
}

function Legend({ albums }) {
  return (
    <svg height={600} width={300}>
      {albums?.map((album, idx) => {
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
  );
}

function ToolChip({ showInfo }) {
  return (
    <g>
      {showInfo &&
        (showInfo.node ? (
          <g>
            <rect width={600} height={75} rx={14} fill={"#FFFFFF91"} />
            <text x="10" y="30" fontSize="20" fill="black">
              アルバム名：{showInfo.album_name}
            </text>
            <text x="10" y="60" fontSize="20" fill="black">
              楽曲名：{showInfo.name}
            </text>
          </g>
        ) : (
          <g>
            <rect width={600} height={75} rx={14} fill={"#FFFFFF91"} />
            <text x="10" y="30" fontSize="20" fill="black">
              類似度：{Math.round(showInfo.value * 1000) / 1000}
            </text>
            <text x="10" y="60" fontSize="20" fill="black">
              楽曲：{showInfo.name}
            </text>
          </g>
        ))}
    </g>
  );
}

function SelectThreshold({ setThreshold }) {
  return (
    <div>
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
  );
}

const color = d3.scaleOrdinal(d3.schemePaired);

export default function SongChart({ edges, songs, albums, setThreshold }) {
  const [showInfo, setShowInfo] = useState(null);

  return (
    <div>
      <div
        className="content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SelectThreshold setThreshold={setThreshold} />
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
              const { id, source, target, value } = link;

              const modSource = source;
              const modTarget = target;

              return (
                <g key={id}>
                  <line
                    stroke="white"
                    strokeWidth={LINK_WIDTH}
                    strokeOpacity={1}
                    x1={modSource.x}
                    y1={modSource.y}
                    x2={modTarget.x}
                    y2={modTarget.y}
                  />
                  {/* ホバー時 */}
                  {showInfo && showInfo.id === id && (
                    <line
                      stroke="white"
                      strokeWidth={LINK_WIDTH + 5}
                      strokeOpacity={0.5}
                      x1={modSource.x}
                      y1={modSource.y}
                      x2={modTarget.x}
                      y2={modTarget.y}
                    />
                  )}
                  {/* 選択範囲を太くするための透かし */}
                  <line
                    stroke="pink"
                    strokeWidth={LINK_WIDTH + 10}
                    strokeOpacity={0}
                    x1={modSource.x}
                    y1={modSource.y}
                    x2={modTarget.x}
                    y2={modTarget.y}
                    onMouseOver={() => {
                      setShowInfo({
                        node: false,
                        id: createEdgeId(modSource, modTarget),
                        name: modSource.name + ", " + modTarget.name,
                        value: value,
                      });
                    }}
                    onMouseLeave={() => {
                      setShowInfo(null);
                    }}
                  />
                </g>
              );
            })}
            {songs.map((node) => {
              return (
                <g key={node.id}>
                  {showInfo && showInfo.id === node.id && (
                    <circle
                      r={RADIUS + 2.5}
                      stroke="none"
                      strokeWidth={0.5}
                      fill="white"
                      cx={node.x}
                      cy={node.y}
                    />
                  )}
                  <circle
                    r={RADIUS}
                    stroke="none"
                    strokeWidth={1}
                    fill={color(node.album_name)}
                    cx={node.x}
                    cy={node.y}
                    onMouseOver={() => {
                      setShowInfo({
                        node: true,
                        id: node.id,
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
                </g>
              );
            })}
            <ToolChip showInfo={showInfo} />
          </svg>

          <Legend albums={albums} />
        </div>
      </div>
    </div>
  );
}
