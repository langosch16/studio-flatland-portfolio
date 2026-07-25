"use client";
import type { Chapter, Project } from "../types";
import FullbleedPlate from "./FullbleedPlate";
import VideoPlate from "./VideoPlate";
import SplitPlate from "./SplitPlate";
import EditorialPlate from "./EditorialPlate";
import CenteredPlate from "./CenteredPlate";

export type PlateProps = {
  project: Project;
  chapter: Chapter;
  index: number;
  onOpen: (p: Project) => void;
};

export default function ProjectPlate(props: PlateProps) {
  switch (props.project.treatment) {
    case "fullbleed": return <FullbleedPlate {...props} />;
    case "video": return <VideoPlate {...props} />;
    case "split": return <SplitPlate {...props} />;
    case "editorial": return <EditorialPlate {...props} />;
    default: return <CenteredPlate {...props} />;
  }
}
