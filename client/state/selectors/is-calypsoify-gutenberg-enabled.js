/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isVipSite from 'state/selectors/is-vip-site';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import getSiteOptions from 'state/selectors/get-site-options';
import getWordPressVersion from 'state/selectors/get-wordpress-version';
import versionCompare from 'lib/version-compare';
import isPluginActive from 'state/selectors/is-plugin-active';

export const isCalypsoifyGutenbergEnabled = ( state, siteId ) => {
	if ( ! siteId ) {
		return false;
	}

	if ( isEnabled( 'jetpack/gutenframe' ) ) {
		if (
			versionCompare(
				get( getSiteOptions( state, siteId ), 'jetpack_version', 0 ),
				'7.3-alpha',
				'>='
			)
		) {
			return false;
		}
	}

	// We do want Calypsoify flows for Atomic sites
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		const wpVersion = getWordPressVersion( state, siteId );

		// But not if they activated Classic editor plugin (effectively opting out of Gutenberg)
		if ( isPluginActive( state, siteId, 'classic-editor' ) ) {
			return false;
		}

		// But only once they have been updated to WordPress version 5.0 or greater
		// Since it will provide Gutenberg editor by default
		if ( versionCompare( wpVersion, '5.0', '>=' ) ) {
			return true;
		}
	}

	// Prevent Calypsoify redirects if Gutenlypso is enabled.
	// This is intentionally placed after Atomic check - we want to default Atomic sites to
	// Calypsoify even if Gutenlypso is on for now. This might change in the future if we decide to
	// move Jetpack and Atomic sites to Gutenlypso too.
	if ( isEnabled( 'gutenberg' ) ) {
		return false;
	}

	// Not ready yet.
	if ( isJetpackSite( state, siteId ) || isVipSite( state, siteId ) ) {
		return false;
	}

	return isEnabled( 'calypsoify/gutenberg' );
};

export default isCalypsoifyGutenbergEnabled;
