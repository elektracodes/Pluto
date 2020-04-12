$pl = {};

$pl.swe = new SwissEph();
$pl.swe.init();

$pl.timezone = (function(){
  var dt = new Date();
  return dt.getTimezoneOffset() / -60;
})();

$pl.planets = {};
$pl.iflag = Swe.SEFLG_MOSEPH|Swe.SEFLG_SPEED;
$pl.julian_utc = 0;
$pl.longitude = 0;
$pl.latitude = 0;

$pl.planetNames = {
  Sun: Swe.SE_SUN,
  Moon: Swe.SE_MOON,
  Mercury: Swe.SE_MERCURY,
  Venus: Swe.SE_VENUS,
  Mars: Swe.SE_MARS,
  Jupiter: Swe.SE_JUPITER,
  Saturn: Swe.SE_SATURN,
  Uranus: Swe.SE_URANUS,
  Neptune: Swe.SE_NEPTUNE,
  Pluto: Swe.SE_PLUTO,
  //MeanNode: Swe.SE_MEAN_NODE,
  //TrueNode: Swe.SE_TRUE_NODE,
  //Chiron: Swe.SE_CHIRON, 
  //Lilith: Swe.SE_MEAN_APOG,
  //Juno: Swe.SE_JUNO,
};

$pl.setTimezone = function(timezone){
  $pl.timezone = timezone;
}

$pl.setCurrentDate = function(){
  var date = new Date();
  $pl.setJsUtcDate(date);
}

$pl.setDate = function(year, month, day, hours, minutes, seconds, timezone){
  if($pl._func.isNull(timezone)) timezone = $pl.timezone;

  $pl.sd = new SweDate(
    parseInt(year),
    parseInt(month),
    parseInt(day),
    parseInt(hours) + parseInt(minutes) / 60 + parseFloat(seconds) / 3600 - parseFloat(timezone)
  );

  $pl.julian_utc = $pl.sd.getJulDay();
}

$pl.getJulDay = function(){
  return $pl.julian_utc;
}

$pl.setJulDay = function(newJD){
  $pl.julian_utc = newJD;
  $pl.sd.jd = newJD;
  $pl.sd.deltatIsValid = false;
  var dt = $pl.sd.swe_revjul(newJD, $pl.sd.calType);
  $pl.sd.year = dt.year;
  $pl.sd.month = dt.month;
  $pl.sd.day = dt.day;
  $pl.sd.hour = dt.hour;
}

$pl.setJsUtcDate = function(date){
  $pl.setDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    0
  );
}

$pl.getUtcDate = function(){
  var dt = new Date(
    $pl.sd.year,
    $pl.sd.month,
    $pl.sd.day,
    parseInt($pl.sd.hour),
    parseInt($pl.sd.hour % 1 * 60),
    $pl.sd.hour * 60 % 1 * 60,
    $pl.sd.hour * 60 % 1 * 60 % 1 * 1000,
  );

  var res = {
    year: dt.getFullYear(),
    month: dt.getMonth(),
    day: dt.getDate(),
    hour: dt.getHours(),
    minute: dt.getMinutes(),
    second: Math.round(dt.getSeconds() + dt.getMilliseconds() / 1000),
  }
  return res;
}

$pl.getPositions = function(planet){
  $pl.planets = {};

  for(var planet in $pl.planetNames){
    //var planet = $pl.planetNames[i];
    $pl._func.getPosition(planet);
  }
  return $pl.planets;
}

$pl._func = {
  isNull: function(val){
    if(val === null || val === undefined) return true;
    return false;
  },

  getPosition: function(planet){
    var ret = {};
    var ret_matrix = new Array(6);

    $pl.swe.calc($pl.julian_utc, $pl.planetNames[planet], $pl.iflag, ret_matrix);
    var longitude = ret_matrix[0];
    var latitude = ret_matrix[1];
    var distance = ret_matrix[2];
    var longitudeSpeed = ret_matrix[3];
    var latitudeSpeed = ret_matrix[4];
    var distanceSpeed = ret_matrix[5];

    $pl.planets[planet] = {
      longitude: longitude,
      latitude: latitude,
      longitudeSpeed: longitudeSpeed,
      latitudeSpeed: latitudeSpeed,
      distance: distance,
      distanceSpeed: distanceSpeed,
      longitude60: {
        degree: parseInt(longitude),
        minutes: parseInt(Math.abs(longitude) % 1 * 60),
        seconds: Math.abs(longitude * 60) % 1 * 60,
      },
      latitude60: {
        degree: parseInt(latitude),
        minutes: parseInt(Math.abs(latitude) % 1 * 60),
        seconds: Math.abs(latitude * 60) % 1 * 60,
      },
      longitudeSpeed60: {
        degree: parseInt(longitudeSpeed),
        minutes: parseInt(Math.abs(longitudeSpeed) % 1 * 60),
        seconds: Math.abs(longitudeSpeed * 60) % 1 * 60,
      },
      latitudeSpeed60: {
        degree: parseInt(latitudeSpeed),
        minutes: parseInt(Math.abs(latitudeSpeed) % 1 * 60),
        seconds: Math.abs(latitudeSpeed * 60) % 1 * 60,
      }
    }

    return $pl.planets[planet];
  },
}