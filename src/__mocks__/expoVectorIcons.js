const React = require('react');

const MockIcon = ({ name, size, color, ...props }) =>
  React.createElement('MaterialCommunityIcons', { name, size, color, testID: name, ...props });

MockIcon.displayName = 'MaterialCommunityIcons';

module.exports = MockIcon;
module.exports.default = MockIcon;
