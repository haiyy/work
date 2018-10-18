export function drawCompose(imgs, canvas, width = 60, heigth = 60)
{
	let imgCount = imgs.length;
	
	if(imgCount < 2)
		return;
	
	var context = canvas.getContext("2d");
	context.rect(0, 0, width, heigth);
	context.fillStyle = "#fff";
	context.fill();
	
	function drawing(n = 0)
	{
		if(n < imgCount)
		{
			var img = new Image();
			img.src = imgs[n];
			img.onload = function() {
				let [x, y] = getXY(n, imgCount);
				context.drawImage(img, x, y, 30, 30);
				drawing(n + 1);
			}
		}
	}
	
	drawing();
}

function getXY(n, imgCount)
{
	if(imgCount === 2)
	{
		return [30 * n, 15];
	}
	else if(imgCount === 3)
	{
		if(n === 0)
		{
			return [15, 0];
		}
		else
		{
			return [30 * (n - 1), 30];
		}
	}
	else
	{
		if(n < 2)
		{
			return [30 * n, 0];
		}
		else
		{
			return [30 * (n - 2), 30];
		}
	}
	
	return [0, 0];
}
