

my $i;

for( $i = 1; $i<115; $i++){
	my $pfx = addDigits($i,3);
	#print $pfx . "\n";
	my $wldc = $pfx . "*.*";
	qx( mkdir $pfx );
	qx( mv $wldc $pfx/ );
}


sub addDigits
{
	my $x = shift;
	my $digits = shift;

	$x = "$x";
	while( length $x < $digits ){
		$x = "0$x";
	}
	return $x;
}
