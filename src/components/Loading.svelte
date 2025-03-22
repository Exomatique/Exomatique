<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	const RADIUS = 0.35;
	const SPACING = 0.1;

	interface Props {
		size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' | number;
		classValue?: ClassValue;
		color?: string | 'gradient';
	}

	const { classValue = '', size = 'small', color = 'gradient' }: Props = $props();

	const mapper = {
		'extra-small': 4,
		small: 6,
		medium: 8,
		large: 10,
		'extra-large': 12
	};

	let real_size = typeof size === 'number' ? String(size) : mapper[size];
</script>

<svg
	aria-hidden="true"
	width={`calc(var(--spacing) * ${real_size})`}
	height={`calc(var(--spacing) * ${real_size})`}
	class={'inline fill-blue-600 text-gray-200 dark:text-gray-600 ' + classValue}
	viewBox="0 0 100 100"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<defs>
		<linearGradient id="Gradient">
			<stop offset="0%" stop-color="#4433ff" />
			<stop offset="100%" stop-color="#ff44dd" />
		</linearGradient>
		<mask id="mask">
			<rect width="100" height="100" fill="black" />
			<g class="origin-center animate-spin">
				<circle cx="50" cy="15" r="10" fill="white" />
			</g>
		</mask>
	</defs>

	<circle cx="50" cy="50" r={RADIUS * 100} stroke="currentColor" fill="none" stroke-width="10" />
	<rect
		width="100"
		height="100"
		fill={color === 'gradient' ? 'url(#Gradient)' : color}
		mask="url(#mask)"
	/>
</svg>
