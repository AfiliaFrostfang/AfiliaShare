// ==UserScript==
// @name         Freigeben Afilia Edit (DOM-safe)
// @version      1.4
// @match        *://leitstellenspiel.de/*
// @match        *://www.leitstellenspiel.de/*
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function getMissions() {
        return Array.from(
            $('#mission_list div.panel-default:not(.panel-success,.mission_panel_green)').parent()
        );
    }

    function shareMission(mission) {
        const missionId = mission.id.replace('mission_', '');

        $.get(`/missions/${missionId}/alliance`)
            .done(() => console.log(`Mission ${missionId} freigegeben.`))
            .fail(() => console.warn(`Mission ${missionId} konnte nicht freigegeben werden.`));
    }

    function shareMissions(minCredits) {
        const missions = getMissions();

        missions.forEach((mission, index) => {
            const sortable = JSON.parse($(mission).attr('data-sortable-by') || '{}');

            if ((sortable.average_credits || 0) >= minCredits) {
                setTimeout(() => shareMission(mission), index * 100);
            }
        });
    }

    function tryInjectButton() {

        // wenn schon da → nichts tun
        if ($('#mission-share').length) return true;

        const $base = $('#chilloutArea');

        if (!$base.length) return false; // noch nicht da

        // Wrapper erzeugen, falls nötig
        if (!$('#afilia-btn-wrapper').length) {
            $base.wrap(
                '<span id="afilia-btn-wrapper" style="display:inline-flex; gap:5px; align-items:center;"></span>'
            );
        }

        $('#afilia-btn-wrapper').append(`
            <a href="#"
               id="mission-share"
               class="btn btn-warning btn-xs">
               Freigeben
            </a>
        `);

        $('#mission-share').on('click', function (e) {
            e.preventDefault();

            const input = prompt('Bitte Mindestcredits eingeben:', '3000');
            if (!input) return;

            const minCredits = parseInt(input, 10);
            if (isNaN(minCredits)) {
                alert('Ungültige Zahl!');
                return;
            }

            shareMissions(minCredits);
        });

        return true;
    }

    // 🔥 robustes Polling statt nur MutationObserver
    const interval = setInterval(() => {
        if (tryInjectButton()) {
            clearInterval(interval);
        }
    }, 300);

    // zusätzlicher Safety-Net Observer
    const observer = new MutationObserver(() => tryInjectButton());
    observer.observe(document.body, { childList: true, subtree: true });

})();
