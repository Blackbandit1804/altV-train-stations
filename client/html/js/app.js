$(() => {
	if ('alt' in window) {
		alt.emit('ready');

		alt.on('data', (data) => {
			$('#items').html('');
			data.forEach((d) => {
				$('#items').append(
					`<div class="item" data-id="${d.id}" data-price="${d.price}">
						<div>${d.name} <span>#${d.id}</span></div>
						<div>$${d.price}</div>
					</div>`
				);
			});
		});

		$(document).on('click', '.item', function() {
			let id = $(this).attr('data-id');
			let price = $(this).attr('data-price');
			alt.emit('travel', id, price);
			alt.emit('close');
		});

		$('#close').click(() => {
			alt.emit('close');
		});
	}
});
