console.clear();

//////////////////////////// drawing function /////////////////////////////

const createChart = async () => {
	const url = "./data/CPI_Cyber_Operations_Database_2020_Version 1.0.csv";

	//////////////////////////// data /////////////////////////////////////////

	let data = [
		{
			title: "Russia",
			label: "(9 operations )",
			group: "G20",
			status: "member"
		},
		{
			title: "Russia",
			label: "(9 operations )",
			group: "GGE",
			status: "member"
		},
		{
			title: "Russia",
			label: "(9 operations )",
			group: "OSCE",
			status: "participant"
		},
		{
			title: "Russia",
			label: "(9 operations )",
			group: "SCO",
			status: "member"
		},
		{
			title: "North Korea",
			label: 5,
			group: "n/a",
			status: "none"
		},
		{
			title: "Iran",
			label: "(4 operations )",
			group: "SCO",
			status: "observer"
		},
		{
			title: "United States",
			label: "(4 operations )",
			group: "G20",
			status: "member"
		},
		{
			title: "United States",
			label: "(4 operations )",
			group: "G7",
			status: "member"
		},
		{
			title: "United States",
			label: "(4 operations )",
			group: "GGE",
			status: "member"
		},
		{
			title: "United States",
			label: "(4 operations )",
			group: "OAS",
			status: "member"
		},
		{
			title: "United States",
			label: "(4 operations )",
			group: "OSCE",
			status: "participant"
		},
		{
			title: "United Arab Emirates",
			label: "(1 case)",
			group: "LAS",
			status: "member"
		}
	];

	// console.log(data);

	data = _.filter(data, (d) => d.group !== "N/A");

	//////////////////////////// accessors ////////////////////////////////////

	const col = "status";
	const xAccessor = (d) => d.group;
	const yAccessor = (d) => d.title;
	const cAccessor = (d) => d[col];

	//////////////////////////// Set up svg ///////////////////////////////////

	const wrapper = d3.select("#appProcesses").append("svg");

	// if element already exists, return selection
	// if it doesn't exist, create it and give it class
	const selectOrCreate = (elementType, className, parent) => {
		const selection = parent.select("." + className);
		if (!selection.empty()) return selection;
		return parent.append(elementType).attr("class", className);
	};

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// update ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const update = () => {
		//////////////////////////// sizes ///////////////////////////////////
		const el = document.getElementById("col");
		const size = el.clientWidth * 0.99;

		let dimensions = {
			width: size,
			height: size * 0.33,
			margin: {
				top: 15,
				right: 200,
				bottom: 60,
				left: 200
			}
		};

		const radius = dimensions.width / 70;

		dimensions.boundedWidth =
			dimensions.width - dimensions.margin.left - dimensions.margin.right;
		dimensions.boundedHeight =
			dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

		//////////////////////////// svg ///////////////////////////////////

		// tag = name; class = .name; id = #name;
		wrapper.attr("width", dimensions.width).attr("height", dimensions.height);

		// shifting
		const bounds = selectOrCreate("g", "wrapper", wrapper).style(
			"transform",
			`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`
		);

		//////////////////////////// colors ///////////////////////////////////////

		const colorsType = ["#113655", "#113655", "#aaaaaa", "#5b8ea7"];

		//////////////////////////// col var ///////////////////////////////////////

		var dataType = _.chain(data)
			.map((d) => d[col])
			.uniq()
			.value();

		var xValue = ["G7", "G20", "GGE", "LAS", "OAS", "OSCE", "SCO", "n/a"];

		var yValue = _.chain(data)
			.map((d) => yAccessor(d))
			.uniq()
			.value()
			.reverse();

		console.log(yValue);

		//////////////////////////// scales ///////////////////////////////////////

		const xScale = d3
			.scalePoint()
			.domain(xValue)
			.range([0, dimensions.boundedWidth]);

		const yScale = d3
			.scalePoint()
			.domain(yValue)
			.range([dimensions.boundedHeight, 0]);

		const cScale = d3.scaleOrdinal().domain(dataType).range(colorsType);

		//////////////////////////// axes /////////////////////////////////////////

		const xAxisGenerator = d3
			.axisBottom()
			.scale(xScale)
			.tickSize(-dimensions.boundedHeight - radius)
			.tickFormat((d) => d.substr(0, 4));

		const xAxis = selectOrCreate("g", "xAxis", bounds)
			.attr(
				"transform",
				"translate(" + "0" + "," + (dimensions.boundedHeight + radius) + ")"
			)
			.transition()
			.call(xAxisGenerator);

		const yAxisGenerator = d3
			.axisLeft()
			.scale(yScale)
			.tickSize(-dimensions.boundedWidth);

		const yAxis = selectOrCreate("g", "yAxis", bounds).call(yAxisGenerator);

		//////////////////////////// plot /////////////////////////////////////////

		// starting position
		const dots = (data) => {
			const tooltip = selectOrCreate(
				"div",
				"tooltip",
				d3.select("#appProcesses")
			);

			const dots = bounds
				.selectAll(".dots")
				.data(data)
				.enter()
				// cell
				.append("circle")
				.attr("class", "dots")
				.attr("r", 0)
				.attr("cx", (d) => xScale(xAccessor(d)))
				.attr("cy", (d) => yScale(yAccessor(d)))
				.style("opacity", 0);

			// animated drop
			dots
				.transition()
				.duration((d, i) => i * 50)
				.attr("r", radius)
				.attr("cx", (d) => xScale(xAccessor(d)))
				.attr("cy", (d) => yScale(yAccessor(d)))
				.attr("fill", (d) => cScale(cAccessor(d)))
				.style("opacity", 1);

			// tooltip
			dots.on("mouseover", (event, d) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("visibility", "visible")
					.style("opacity", 1)
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.text(d.title);
				// smoother change in opacity
				dots.transition().style("opacity", 0.5);
			});

			dots.on("mousemove", (d, i) => {
				var mouseX = event.pageX + 5;
				var mouseY = event.pageY + 5;
				d3.select(".tooltip")
					.style("left", mouseX + "px")
					.style("top", mouseY + "px")
					.html(
						"<b>" +
							d.title +
							"</b>" +
							"<br>" +
							d.group +
							" " +
							d.status +
							"<br>" +
							"<i>" +
							d.label +
							"</i>"
					);
			});

			dots.on("mouseleave", function (d) {
				d3.select(".tooltip").style("visibility", "hidden");
				dots.transition().style("opacity", 1);
			});
		};
		dots(data);
	};

	update();
};

createChart();
