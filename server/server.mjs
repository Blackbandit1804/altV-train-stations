import * as alt from 'alt';
import { config } from './config';

alt.on('playerConnect', handlePlayerConnect);
alt.on('entityEnterColshape', handleEntityEnterColshape);
alt.on('entityLeaveColshape', handleEntityLeaveColshape);

alt.onClient('trainstations:travel', handleTravel);

function handlePlayerConnect(player) {
	player.setSyncedMeta('isInTrainStation', false);

	let blips = [];
	let markers = [];

	config.positions.forEach((p) => {
		blips.push({
			pos: p.pos,
			sprite: config.blip.sprite,
			color: config.blip.color,
			scale: config.blip.scale,
			shortRange: config.blip.shortRange,
			name: config.blip.name
		});

		markers.push({
			pos: p.pos,
			type: config.marker.type,
			color: config.marker.color,
			alpha: config.marker.alpha,
			scale: config.marker.scale,
			height: config.marker.height
		});

		let newShape = new alt.ColshapeCylinder(
			p.pos.x,
			p.pos.y,
			p.pos.z - 1,
			config.colshape.radius,
			config.colshape.height
		);
		newShape.nameType = config.colshape.nameType;
	});

	alt.emitClient(player, 'trainstations:createBlips', blips);
	alt.emitClient(player, 'trainstations:createMarkers', markers);
	alt.emitClient(player, 'trainstations:config', config);
}

function handleEntityEnterColshape(colshape, entity) {
	if (entity instanceof alt.Player) {
		if (colshape.nameType === config.colshape.nameType) {
			notifyPlayer(entity, `~g~E~w~: select destination`);
			entity.setSyncedMeta('isInTrainStation', true);
		}
	}
}

function handleEntityLeaveColshape(colshape, entity) {
	if (entity instanceof alt.Player) {
		if (colshape.nameType === config.colshape.nameType) entity.setSyncedMeta('isInTrainStation', false);
	}
}

function handleTravel(player, id, price) {
	alt.emitClient(player, 'trainstations:secureTravel', true);

	// do something with player's money like
	// if (player.money > price) player.money -= price

	setTimeout(() => {
		let destination = config.positions.find((p) => p.id === parseInt(id));
		player.pos = destination.pos;
		setTimeout(() => {
			alt.emitClient(player, 'trainstations:secureTravel', false);
			notifyPlayer(player, `You paid ~g~$${price}~w~.`);
			player.setSyncedMeta('isInTrainStation', true);
		}, 1000);
	}, 500);
}

function notifyPlayer(player, text) {
	alt.emitClient(player, 'trainstations:notify', text);
}
