import * as alt from 'alt';
import * as native from 'natives';

let webView = null;
let config = {};

alt.on('keydown', handleKeydown);

alt.onServer('trainstations:config', handleConfig);
alt.onServer('trainstations:createBlips', handleCreateBlips);
alt.onServer('trainstations:createMarkers', handleCreateMarkers);
alt.onServer('trainstations:notify', handleNotify);
alt.onServer('trainstations:secureTravel', handleSecureTravel);

function handleKeydown(key) {
	if (key === 69) {
		if (alt.Player.local.getSyncedMeta('isInTrainStation')) {
			if (!webView) {
				webView = new alt.WebView('http://resource/client/html/index.html');

				webView.on('ready', () => {
					let webViewData = [];
					let currentPosition = alt.Player.local.pos;
					config.positions.forEach((p) => {
						let newPosition = p.pos;
						let distance = native.getDistanceBetweenCoords(
							currentPosition.x,
							currentPosition.y,
							currentPosition.z,
							newPosition.x,
							newPosition.y,
							newPosition.z,
							false
						);
						if (distance > 50) {
							let price = (config.general.pricePerKm * (distance / 1000)).toFixed(2);
							webViewData.push({
								id: p.id,
								name: p.name,
								price
							});
						}
					});
					webView.emit('data', webViewData);
				});

				webView.on('travel', (id, price) => {
					alt.emitServer('trainstations:travel', id, price);
				});

				webView.on('close', () => {
					webView.destroy();
					webView = null;
					alt.toggleGameControls(true);
					alt.showCursor(false);
				});
			}
			webView.focus();
			alt.toggleGameControls(false);
			alt.showCursor(true);
		}
	}
}

function handleConfig(_config) {
	config = _config;
}

function handleCreateBlips(blips) {
	blips.forEach((b) => {
		let newBlip = new alt.PointBlip(b.pos.x, b.pos.y, b.pos.z);
		newBlip.sprite = b.sprite;
		newBlip.color = b.color;
		newBlip.scale = b.scale;
		newBlip.shortRange = b.shortRange;
		newBlip.name = b.name;
	});
}

function handleCreateMarkers(markers) {
	alt.everyTick(() => {
		markers.forEach((m) => {
			native.drawMarker(
				m.type,
				m.pos.x,
				m.pos.y,
				m.pos.z - 1,
				0,
				0,
				0,
				0,
				0,
				0,
				m.scale,
				m.scale,
				m.scale,
				m.color.r,
				m.color.g,
				m.color.b,
				m.alpha,
				false,
				false,
				2,
				false,
				undefined,
				undefined,
				false
			);
		});
	});
}

function handleNotify(text) {
	native.beginTextCommandThefeedPost('STRING');
	native.addTextComponentSubstringPlayerName(text);
	native.endTextCommandThefeedPostTicker(false, true);
}

function handleSecureTravel(toggle) {
	toggle ? native.doScreenFadeOut(500) : native.doScreenFadeIn(500);
	native.freezeEntityPosition(alt.Player.local.scriptID, toggle);
}
