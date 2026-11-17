import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import GuidedTour from "./tour/GuidedTour.jsx";

// The "?" guide on each learning page. It used to be a centred card that
// named the part of the page in words (and leaked the CSS selector); now it
// lights up the real element with the same spotlight as the app tour, so a
// new player sees where to look instead of being told.
//
// Steps come from data/webTutorials.js. A step whose element is not on screen
// is skipped; a page with none of them falls back to a centred bubble.
//
// It opens from the header's "?" (utils/tourEvents.js): while a page with a
// guide is showing, that button explains this page rather than the menu bar.
// Pages used to carry a second, floating "?" for this, and the two opened
// different things.

const toTourSteps = (tutorial) =>
  (tutorial?.steps || []).map((step, index) => ({
    id: step.id,
    target: step.target,
    title: step.title,
    body: step.description,
    lumi: step.lumi || (index === 0 ? "happy" : "smile"),
  }));

export default function WebTutorialModal({ tutorial, isOpen, onOpen, onClose, onComplete }) {
  const { i18n } = useTranslation();
  const hasSteps = Boolean(tutorial?.steps?.length);

  useEffect(() => {
    if (!onOpen || !hasSteps) return undefined;
    const answer = (event) => {
      if (event.detail?.handled) return;
      event.detail.handled = true;
      onOpen();
    };
    window.addEventListener("pyarena:tour-request", answer);
    return () => window.removeEventListener("pyarena:tour-request", answer);
  }, [onOpen, hasSteps]);

  if (!isOpen || !hasSteps) return null;

  const close = (reason) => {
    if (reason === "done") onComplete?.();
    onClose?.();
  };

  return (
    <GuidedTour
      steps={toTourSteps(tutorial)}
      onClose={close}
      isThai={!String(i18n.language || "th").startsWith("en")}
    />
  );
}
