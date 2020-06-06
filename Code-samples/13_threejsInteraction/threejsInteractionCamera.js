let container;
let camera, scene, raycaster, renderer, sphere, clock;

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;

let limits = {
    x: new THREE.Vector2(-30, 30),
    y: new THREE.Vector2(-30, 30)
};

let startTime = 0;
let moveLeft = false, moveRight = true;

let floorUrl = "../images/checker_large.gif";

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

    // camera.rotation.set(Math.PI / 6, 0, 0);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
    
    // floor

    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );

    let geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    
    for ( let i = 0; i < 25; i ++ ) 
    {
        let object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
        let row = Math.floor(i / 5);
        let column = i % 5;

        object.name = 'Cube' + i;

        object.position.set(-40 + 20*column ,-40 + 20*row, -100);
        
        scene.add( object );
    }
    
    let sphereGeometry = new THREE.SphereGeometry(2.5, 20, 20);
    sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff }));
    sphere.position.set(0, 0, -50);

    scene.add(sphere);

    raycaster = new THREE.Raycaster();
        
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);

    clock = new THREE.Clock();
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children );
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            console.log(INTERSECTED);
            if ( INTERSECTED )
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ closer ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children );

    console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ intersects.length - 1 ].object;
        CLICKED.material.emissive.setHex( 0x00ff00 );
        console.log(CLICKED);
        if(!animator.running)
        {
            for(let i = 0; i<= animator.interps.length -1; i++)
            {
                animator.interps[i].target = CLICKED.rotation;
            }
            playAnimations();
        }
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}
//

function rayFromCameraToSphere()
{
    let raycasterSphere = new THREE.Raycaster();

    let direction = new THREE.Vector3();
    direction.copy(sphere.position);

    raycasterSphere.set(camera.position, direction.normalize())

    let intersects = raycasterSphere.intersectObjects( scene.children );
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            console.log(INTERSECTED);
            if ( INTERSECTED )
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ closer ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function animateSphere()
{
    let deltaT = clock.getDelta();
    let speed = 10;

    if(moveRight)
        sphere.position.y += speed * deltaT;

    if(moveLeft)
        sphere.position.y -= speed * deltaT;

    if(sphere.position.y > limits.x.y){ moveRight = false; moveLeft = true;}
    if(sphere.position.y < limits.x.x){ moveRight = true; moveLeft = false;}

    if(startTime < 0.5)
    {
        startTime += deltaT;
    }
    else{
        startTime = 0;
        console.log("Launching ray");
        rayFromCameraToSphere();
    }    
}

function run() 
{
    requestAnimationFrame( run );
    animateSphere();
    render();
}

function render() 
{
    renderer.render( scene, camera );
}